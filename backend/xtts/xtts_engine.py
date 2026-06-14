"""XTTS text-to-speech engine for the AI interviewer backend.

This module attempts to use Coqui TTS (XTTS v2). Importing Coqui and
`torchaudio` can sometimes fail on Windows due to binary / wheel issues.
To make the backend resilient we delay importing Coqui until synthesis time
and provide a Windows PowerShell SAPI fallback that writes a WAV file
without requiring additional Python packages.
"""

from __future__ import annotations

import os
import subprocess
import sys
import traceback
from threading import Lock
from typing import Final

# Configuration
OUTPUT_PATH: Final[str] = "backend/outputs/output.wav"
MODEL_NAME: Final[str] = "tts_models/multilingual/multi-dataset/xtts_v2"
LANGUAGE: Final[str] = "en"
DEFAULT_SPEAKER: Final[str] = os.getenv("XTTS_SPEAKER", "Ana Florence")

# Internal cache / lock for Coqui model when available
_MODEL_LOCK = Lock()
_TTS_MODEL = None


def _synthesize_with_coqui(text: str, out_path: str) -> None:
    """Attempt synthesis using Coqui TTS. Imports are delayed so failures
    surface at call-time and can be handled by the caller.
    """
    # Import here so module import of this file doesn't fail on broken torchaudio
    def _synthesize_with_coqui(text: str, out_path: str) -> None:
        print("XTTS DISABLED - skipping synthesis")
        return

    import torch
    from TTS.api import TTS
    global _TTS_MODEL

    def _build_model() -> TTS:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cpu":
            print("XTTS: CUDA unavailable, forcing CPU mode")

        model = TTS(model_name=MODEL_NAME, progress_bar=False)
        try:
            model = model.to(device)
        except Exception:
            # Some TTS wrappers may perform .to() differently; ignore if it fails
            pass
        return model

    if _TTS_MODEL is None:
        print("XTTS: Building Coqui model (this may download weights)...")
        _TTS_MODEL = _build_model()

    # Synthesize under a lock to be thread-safe
    with _MODEL_LOCK:
        print("XTTS: Generating audio using Coqui TTS...")
        _TTS_MODEL.tts_to_file(
            text=text.strip(),
            file_path=out_path,
            speaker=DEFAULT_SPEAKER,
            language=LANGUAGE,
            split_sentences=True,
        )


def _synthesize_with_powershell(text: str, out_path: str) -> None:
    """Windows PowerShell SAPI fallback. Uses System.Speech to write a WAV file.

    This avoids extra Python dependencies and works on most Windows systems.
    """
    abs_path = os.path.abspath(out_path)
    safe_text = text.replace("'", "''")
    # PowerShell single-quoted strings are literal; we double single-quotes
    ps_cmd = (
        "Add-Type -AssemblyName System.Speech;"
        " $s = New-Object System.Speech.Synthesis.SpeechSynthesizer;"
        f" $s.SetOutputToWaveFile('{abs_path}');"
        f" $s.Speak('{safe_text}'); $s.Dispose();"
    )

    print("XTTS: PowerShell fallback - invoking SAPI to create WAV...")
    # Run PowerShell non-interactively
    subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            ps_cmd,
        ],
        check=True,
    )


def text_to_speech(text: str) -> str:
    """Synthesize text to `backend/outputs/output.wav`.

    The function attempts Coqui TTS first; if that fails for any reason we
    fall back to the PowerShell SAPI synthesizer on Windows. The function
    raises RuntimeError on failure and prints tracebacks for easier debugging.
    """
    try:
        if not text or not text.strip():
            raise ValueError("text is required.")

        out_dir = os.path.dirname(OUTPUT_PATH)
        os.makedirs(out_dir, exist_ok=True)

        # Try Coqui TTS (may raise ImportError or runtime errors)
        try:
            print("XTTS: Attempting Coqui TTS synthesis...")
            _synthesize_with_coqui(text, OUTPUT_PATH)
            print("XTTS: Coqui TTS finished")
        except Exception:
            print("XTTS: Coqui TTS failed, falling back to PowerShell SAPI")
            traceback.print_exc()
            # If not on Windows, re-raise so caller knows there is no fallback
            if sys.platform.lower() not in ("win32", "cygwin"):
                raise
            _synthesize_with_powershell(text, OUTPUT_PATH)

        # Verify output file
        if not os.path.exists(OUTPUT_PATH) or os.path.getsize(OUTPUT_PATH) == 0:
            raise RuntimeError("XTTS output file was not created or is empty")

        print("XTTS: Audio saved ->", OUTPUT_PATH)
        return OUTPUT_PATH
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"XTTS generation failed: {e}") from e


__all__ = ["LANGUAGE", "MODEL_NAME", "OUTPUT_PATH", "text_to_speech"]

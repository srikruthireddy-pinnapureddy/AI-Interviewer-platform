"""Gemini engine for the AI interviewer backend."""

from __future__ import annotations

import os
import traceback
from typing import Optional


SYSTEM_PROMPT = (
    "You are Priya, a concise but natural AI interviewer. "
    "Follow the provided interview priorities, ask one question at a time, "
    "keep responses short, and stay conversational."
)


def _fallback_response(candidate_text: str, user_prompt: Optional[str] = None) -> str:
    """A lightweight fallback interviewer when Gemini isn't available.

    Keeps responses short and asks a follow-up based on the candidate text.
    """
    base = "Thanks — got it."
    if user_prompt:
        # If a user prompt was explicitly provided, echo it concisely.
        return f"{base} {user_prompt.strip()}"

    # Very simple heuristic follow-ups.
    if not candidate_text or not candidate_text.strip():
        return f"{base} Could you briefly introduce yourself and your current role?"

    txt = candidate_text.strip()
    if "experience" in txt.lower():
        return f"{base} Can you tell me more about a recent project demonstrating that experience?"
    if "lead" in txt.lower() or "managed" in txt.lower():
        return f"{base} How did you handle a difficult team situation as a lead?"
    if len(txt.split()) < 10:
        return f"{base} Could you expand on that with a concrete example?"
    return f"{base} Interesting — what's one challenge you faced and how you solved it?"


def ask_gemini(candidate_text: str, *, system_prompt: Optional[str] = None, user_prompt: Optional[str] = None) -> str:
    """Try to call Gemini; if unavailable, return a deterministic fallback response.

    This function lazy-loads the `google.generativeai` library so the app can
    start even when the dependency has incompatible transitive packages.
    """
    prompt_parts = []
    if user_prompt:
        prompt_parts.append(user_prompt.strip())
    if candidate_text and candidate_text.strip():
        prompt_parts.append(f"Candidate transcript:\n{candidate_text.strip()}")

    prompt = "\n\n".join(prompt_parts).strip()
    if not prompt:
        # If nothing to prompt, use fallback behaviour.
        return _fallback_response(candidate_text, user_prompt)

    try:
        import google.generativeai as genai

        API_KEY = os.getenv("GOOGLE_API_KEY")
        if not API_KEY:
            # If no key is set, fall back rather than raising at import time.
            return _fallback_response(candidate_text, user_prompt)

        genai.configure(api_key=API_KEY)
        MODEL_NAME = "models/gemini-2.5-flash"

        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_prompt or SYSTEM_PROMPT,
        )
        print("\n===== GEMINI REQUEST =====")
        print("Prompt length:", len(prompt))
        print("Model:", MODEL_NAME)
        print("==========================\n")
        response = model.generate_content(prompt)
        return (response.text or "").strip() or _fallback_response(candidate_text, user_prompt)
    except Exception as e:
        import traceback

        print("\n========== GEMINI ERROR ==========")
        traceback.print_exc()
        print("==================================\n")

        raise


__all__ = ["SYSTEM_PROMPT", "ask_gemini"]

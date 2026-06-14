from whisper.stt import transcribe_audio

text = transcribe_audio("sample.wav")

print(text)
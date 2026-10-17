# The hand-off proof's spoken input (ux/Dictate/test/handoff.mjs): two sentences that form one ask, 16 kHz mono, 60 s of silence after.
param([string]$out = "ask.wav")
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$s.SetOutputToWaveFile($out, $fmt)
$pb = New-Object System.Speech.Synthesis.PromptBuilder
$pb.AppendBreak([TimeSpan]::FromSeconds(1))
$pb.AppendText("Please file a task for this page."); $pb.AppendBreak([TimeSpan]::FromSeconds(3))
$pb.AppendText("The page's readme should link its architecture doc."); $pb.AppendBreak([TimeSpan]::FromSeconds(60))
$s.Speak($pb); $s.Dispose()

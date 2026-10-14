# The walk's spoken input: four sentences with 9-12 s gaps, 16 kHz mono, written beside the scratch walk.mjs as four.wav (not committed: 2.4 MB).
param([string]$out = "four.wav")
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$s.SetOutputToWaveFile($out, $fmt)
$pb = New-Object System.Speech.Synthesis.PromptBuilder
$pb.AppendText("This is an end to end test of the dictation flow."); $pb.AppendBreak([TimeSpan]::FromSeconds(9))
$pb.AppendText("Smart assistant, which page lists all the sessions?"); $pb.AppendBreak([TimeSpan]::FromSeconds(12))
$pb.AppendText("This third sentence only checks the order. It is not a task."); $pb.AppendBreak([TimeSpan]::FromSeconds(9))
$pb.AppendText("Smart assistant, please reply with one short line to end the test."); $pb.AppendBreak([TimeSpan]::FromSeconds(30))
$s.Speak($pb); $s.Dispose()

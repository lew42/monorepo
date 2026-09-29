' Proven no-flash launcher for the Servex logon task (public/framework/ai/2026-09-28/hidden-windows/).
' wscript.exe is a GUI-subsystem exe (no console of its own); WScript.Shell.Run with
' windowStyle=0 starts the target via ShellExecute/SW_HIDE, which suppresses a console app's
' window from creation, unlike "powershell -WindowStyle Hidden" (which flashes: PowerShell
' hides its own window a moment AFTER Windows has already shown it).
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -WindowStyle Hidden -Command ""cd 'C:\Code\lew42\monorepo'; node Servex/sustain.mjs""", 0, False

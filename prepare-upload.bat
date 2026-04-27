@echo off
set SOURCE=C:\Users\ahmed\Desktop\new shit\student-assistant
set DEST=C:\Users\ahmed\Desktop\new shit\student-assistant-clean

echo [1/5] Creating clean folder...
if exist "%DEST%" rd /s /q "%DEST%"
mkdir "%DEST%"

echo [2/5] Copying source files...
xcopy "%SOURCE%\src" "%DEST%\src\" /E /I /H /Y

echo [3/5] Copying config files...
copy "%SOURCE%\package.json" "%DEST%\" /Y
copy "%SOURCE%\next.config.mjs" "%DEST%\" /Y
copy "%SOURCE%\tsconfig.json" "%DEST%\" /Y
copy "%SOURCE%\tailwind.config.ts" "%DEST%\" /Y
copy "%SOURCE%\postcss.config.mjs" "%DEST%\" /Y
copy "%SOURCE%\.eslintrc.json" "%DEST%\" /Y
copy "%SOURCE%\.gitignore" "%DEST%\" /Y
copy "%SOURCE%\next-env.d.ts" "%DEST%\" /Y
copy "%SOURCE%\.env.example" "%DEST%\" /Y

echo [4/5] Copying documentation...
copy "%SOURCE%\README.md" "%DEST%\" /Y
copy "%SOURCE%\LICENSE" "%DEST%\" /Y
xcopy "%SOURCE%\.github" "%DEST%\.github\" /E /I /H /Y

echo [5/5] Done! Clean folder ready at:
echo %DEST%
echo.
echo Files ready for manual upload to GitHub!
pause

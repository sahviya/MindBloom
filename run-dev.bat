@echo off
setlocal enableextensions
pushd "%~dp0"

echo Installing dependencies (if needed)...
npm install || goto :error

echo Generating Prisma client...
npx prisma generate --schema ".\prisma\schema.prisma" || goto :error

echo Pushing Prisma schema to SQLite...
npx prisma db push --schema ".\prisma\schema.prisma" || goto :error

echo Starting dev server (Express + Vite)...
npm run dev:server || goto :error

popd
endlocal
goto :eof

:error
echo.
echo [run-dev] A step failed. See the error above.
popd
endlocal
exit /b 1

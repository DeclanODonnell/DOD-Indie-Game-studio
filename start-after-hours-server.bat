@echo off
cd /d "%~dp0"
dotnet run --project server\AfterHoursServer\AfterHoursServer.csproj --urls http://127.0.0.1:5050

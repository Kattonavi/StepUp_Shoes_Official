@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2

@IF "%JAVA_HOME%"=="" (
    SET JAVA_BIN=java
) ELSE (
    SET JAVA_BIN=%JAVA_HOME%\bin\java
)

@SET MAVEN_WRAPPER_DIR=%~dp0.mvn\wrapper
@SET MAVEN_WRAPPER_PROPERTIES=%MAVEN_WRAPPER_DIR%\maven-wrapper.properties
@SET DISTRIBUTION_URL=

@FOR /F "usebackq tokens=1,* delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    IF "%%A"=="distributionUrl" SET "DISTRIBUTION_URL=%%B"
)

@IF "%DISTRIBUTION_URL%"=="" (
    ECHO [ERROR] Cannot read distributionUrl from %MAVEN_WRAPPER_PROPERTIES%
    EXIT /B 1
)

@FOR %%F IN ("%DISTRIBUTION_URL%") DO SET "DIST_FILENAME=%%~nxF"
@SET "DIST_NAME=%DIST_FILENAME:-bin.zip=%"

@SET "MAVEN_USER_HOME=%USERPROFILE%\.m2"
@SET "MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\%DIST_NAME%"

@IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" GOTO :mvn_found
@IF EXIST "%MAVEN_HOME%\bin\mvn" GOTO :mvn_found

@ECHO Downloading Maven from %DISTRIBUTION_URL%...
@IF NOT EXIST "%MAVEN_HOME%" MKDIR "%MAVEN_HOME%"
@SET "DOWNLOAD_DEST=%MAVEN_HOME%\download.zip"

@powershell -NoProfile -NonInteractive -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
    "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%DOWNLOAD_DEST%'"

@IF ERRORLEVEL 1 (
    ECHO [ERROR] Failed to download Maven.
    EXIT /B 1
)

@powershell -NoProfile -NonInteractive -Command ^
    "Add-Type -AssemblyName System.IO.Compression.FileSystem; " ^
    "[IO.Compression.ZipFile]::ExtractToDirectory('%DOWNLOAD_DEST%', '%MAVEN_HOME%')"

@DEL /F /Q "%DOWNLOAD_DEST%"

@FOR /D %%D IN ("%MAVEN_HOME%\apache-maven-*") DO (
    @XCOPY "%%D\*" "%MAVEN_HOME%\" /E /I /Q /Y > NUL
    @RMDIR /S /Q "%%D"
)

:mvn_found
@IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
    @"%MAVEN_HOME%\bin\mvn.cmd" %*
) ELSE (
    @"%MAVEN_HOME%\bin\mvn" %*
)
@EXIT /B %ERRORLEVEL%

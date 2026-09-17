@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0")

@SET MAVEN_WRAPPER_JAR=%BASE_DIR%.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%BASE_DIR%.mvn\wrapper\maven-wrapper.properties

@IF "%JAVA_HOME%"=="" (
  @SET "JAVACMD=java"
) ELSE (
  @SET "JAVACMD=%JAVA_HOME%\bin\java"
)

@IF EXIST "%MAVEN_WRAPPER_JAR%" GOTO execute

@SET /p WRAPPER_URL=<"%MAVEN_WRAPPER_PROPERTIES%"
@FOR /F "tokens=2 delims==" %%A IN ('findstr /I "wrapperUrl" "%MAVEN_WRAPPER_PROPERTIES%"') DO (
  @SET WRAPPER_URL=%%A
)
@ECHO Downloading Maven Wrapper...
@curl -fsSL -o "%MAVEN_WRAPPER_JAR%" "%WRAPPER_URL%"

:execute
@"%JAVACMD%" -classpath "%MAVEN_WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*

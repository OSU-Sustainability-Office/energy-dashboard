/*
  Filename: setupJest.js
  Info: Run preliminary setup tasks before each Jest test file is ran.
*/

// These lines of code include a plugin which allows Jest to run require.context directives from web-pack
import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
registerRequireContextHook()

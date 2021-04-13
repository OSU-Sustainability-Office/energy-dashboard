/**
* @Author: Milan Donhowe
* @Date Created: 4/13/2021
* @Date Last Modified: 4/13/2021 
* @Email: Milan.Donhowe@oregosntate.edu
* @Description: Run preliminary setup tasks before each Jest test file is ran.
*/

// These lines of code include a plugin which allows Jest to run require.context directives from web-pack
import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
registerRequireContextHook()

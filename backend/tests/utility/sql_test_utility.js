/*
 * @Author: Milan Donhowe
 * @Date:   5/6/2021
 * @Copyright:  Oregon State University 2021
 * @Description: Helper functions for the sqlite test database.
 */

// Super hacky function to bypass sqlite3's keyword restrictions
// by replacing each instance of a keyword with a prefixed alternative
export function fixSQLKeywords (line) {
  const keywords = ['group', 'default']
  for (let keyword of keywords) {
    const searchRegex = new RegExp(`(?<!_)${keyword}(?!_)`, 'g')
    if (line.match(searchRegex)) {
      line = line.replace(searchRegex, `building_${keyword}`)
    }
  }

  return line
}

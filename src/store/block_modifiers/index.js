const modules = {}
const modifiers = import.meta.globEager('./*.mod.js')

Object.keys(modifiers).forEach(key => {
  const module = modifiers[key].default
  modules[module.name] = module
})

export default modules

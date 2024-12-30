const modules = {}
const modifiers = import.meta.glob('./*.mod.js')

for (const path in modifiers) {
  modifiers[path]().then(module => {
    modules[module.default.name] = module.default
  })
}

export default modules

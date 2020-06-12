/*
 * @Author: you@you.you
 * @Date:   Wednesday April 29th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday April 29th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  props: ['nameSpace'],
  beforeCreate () {
    const moduleName = `${this.$options.propsData.nameSpace}/`
    let getterKeys = Reflect.ownKeys(this.$store.getters).reduce((prev, current) => {
      let splitString = current.split(moduleName)
      if (splitString.length === 2 && splitString[1].split('/').length === 1) {
        prev[splitString[1]] = current
      }
      return prev
    }, {})
    let mutationKeys = Reflect.ownKeys(this.$store._mutations).reduce((prev, current) => {
      let splitString = current.split(moduleName)
      if (splitString.length === 2 && splitString[1].split('/').length === 1) {
        prev[splitString[1]] = current
      }
      return prev
    }, {})
    let actionKeys = Reflect.ownKeys(this.$store._actions).reduce((prev, current) => {
      let splitString = current.split(moduleName)
      if (splitString.length === 2 && splitString[1].split('/').length === 1) {
        prev[splitString[1]] = current
      }
      return prev
    }, {})
    this.$options.computed = {
      ...this.$options.computed,
      ...mapGetters(getterKeys)
    }
    this.$options.methods = {
      ...this.$options.methods,
      ...mapMutations(mutationKeys),
      ...mapActions(actionKeys)
    }
  }
}

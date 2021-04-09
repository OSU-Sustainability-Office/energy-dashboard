/**
* @Author: Milan Donhowe
* @Date: 4/9/2021
* @Email: Milan.Donhowe@oregosntate.edu
* @Description: Example Vue Test for components.  Feel free to use this as
*               a quick reference to writing new Vue Component unit tests.
*/

// For testing components import either "mount" or "shallow mount"
// mount will include and sub-components whereas shallowMount will not.
import { shallowMount } from '@vue/test-utils'


// Typically you would import a component but for this example we will
// describe a simple one here in file.
const HelloWorld = {
  template: '<p>{{ msg }}></p>',
  props: ['msg']
}
//import HelloWorld from '@/components/HelloWorld.vue'


// The test logic itself 
describe('Example Jest Unit Test', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})

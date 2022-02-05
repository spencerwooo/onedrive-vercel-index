import { Fragment } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'

import useLocalStorage from '../utils/useLocalStorage'

export const layouts: Array<{ id: number; name: 'Grid' | 'List'; icon: IconProp }> = [
  { id: 1, name: 'List', icon: 'th-list' },
  { id: 2, name: 'Grid', icon: 'th' },
]

export const SwitchLayout = () => {
  const [preferredLayout, setPreferredLayout] = useLocalStorage('preferredLayout', layouts[0])

  return (
    <div className="w-24 flex-shrink-0 text-sm text-gray-600 dark:text-gray-300 md:w-28">
      <Listbox value={preferredLayout} onChange={setPreferredLayout}>
        <Listbox.Button className="relative w-full cursor-pointer rounded pl-2">
          <span className="pointer-events-none flex items-center">
            <FontAwesomeIcon className="mr-2 h-4 w-4" icon={preferredLayout.icon} />
            <span>{preferredLayout.name}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon className="h-4 w-4" icon="chevron-down" />
          </span>
        </Listbox.Button>

        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 w-36 overflow-auto rounded border border-gray-900/10 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-500/30 dark:bg-gray-800">
            {layouts.map(layout => (
              <Listbox.Option
                key={layout.id}
                className={`${
                  layout.name === preferredLayout.name &&
                  'bg-blue-50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-400'
                } relative flex cursor-pointer select-none items-center py-1.5 pl-9 text-gray-600 hover:opacity-80 dark:text-gray-300`}
                value={layout}
              >
                {layout.name === preferredLayout.name && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon className="h-4 w-4" icon="check" />
                  </span>
                )}
                <FontAwesomeIcon className="mr-2 h-4 w-4" icon={layout.icon} />
                <span className={layout.name === preferredLayout.name ? 'font-medium' : 'font-normal'}>
                  {layout.name}
                </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}

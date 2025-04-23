import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Tasks', to: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Groups', to: '/groups', icon: UserGroupIcon },
  { name: 'Resources', to: '/resources', icon: BookOpenIcon },
]

function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
import { useContext } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../contexts/UserContext"

const Header = () => {
    const { user } = useContext(UserContext)
    return <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                    <Link to="/">
                        Цахим шалгалтын систем
                    </Link>
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8 items-center">
                    {!user && <Link to="/login" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Нэвтрэх</Link>}
                    <Link to="/team1" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 1</Link>
                    <Link to="/team2" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 2</Link>
                    <Link to="/team3" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 3</Link>
                    <Link to="/team4" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 4</Link>
                    <Link to="/team6" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 6</Link>
                </div>
                <div className="sm:hidden flex items-center">
                    <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded="false">
                        <span className="sr-only">Үндсэн цэсийг нээх</span>
                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div className="sm:hidden" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1">
                <Link to="/team1" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 1</Link>
                <Link to="/team2" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 2</Link>
                <Link to="/team3" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 3</Link>
                <Link to="/team4" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 4</Link>
                <Link to="/team6" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Баг 6</Link>
            </div>
        </div>
    </header>
}

export default Header

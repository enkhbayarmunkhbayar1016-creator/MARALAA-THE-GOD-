import { Link } from "react-router-dom"
import { AiOutlineFacebook, AiOutlineInstagram, AiOutlineTwitter } from "react-icons/ai";

const Footer = () => {
    return <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Бидний тухай</h3>
                    <p className="text-sm">
                        Веб систем ба технологи хичээлийн оюутнуудын бүтээл.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Багийн танилцуулга</h3>
                    <ul>
                        <li className="mb-2"><Link to="/team1" className="hover:text-gray-300">1-р баг</Link></li>
                        <li className="mb-2"><Link to="/team2" className="hover:text-gray-300">2-р баг</Link></li>
                        <li className="mb-2"><Link to="/team3" className="hover:text-gray-300">3-р баг</Link></li>
                        <li className="mb-2"><Link to="/team4" className="hover:text-gray-300">4-р баг</Link></li>
                        <li className="mb-2"><Link to="/team6" className="hover:text-gray-300">6-р баг</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Сошиал хаяг</h3>
                    <div className="flex space-x-4">
                        <AiOutlineFacebook />
                        <AiOutlineInstagram />
                        <AiOutlineTwitter />
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
                <p>&copy; 2026 ШУТИС-МХТС.</p>
            </div>
        </div>
    </footer>

}

export default Footer

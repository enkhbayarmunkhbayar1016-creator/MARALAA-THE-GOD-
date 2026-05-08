import { Link } from "react-router-dom";

const SideMenu = () => {
  return <ul>
    <li><Link to="/team1/">Эхлэл</Link></li>
    <li><Link to="/team1/example">Жишээ</Link></li>
  </ul>
};

export default SideMenu;

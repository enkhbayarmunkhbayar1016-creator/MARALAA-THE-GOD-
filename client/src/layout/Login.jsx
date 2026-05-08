import { useContext, useState } from "react";
import { redirect } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { UserContext } from "../contexts/UserContext";

const Login = () => {
    const { login, user, logout } = useContext(UserContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = await login(username, password);
        if (data) {
            redirect("/");
        } else {
            alert("Нэвтрэх эрхгүй байна.");
        }
    };
    const [value, setValue] = useState();
    const tinymceOptions = {
        relative_urls: false,
        height: 300,
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "emoticons template paste textcolor help",
        ],
        toolbar:
            "undo redo | styleselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | media | forecolor backcolor emoticons",
        fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
    };

    return user ? (
        <div>
            <div>Сайн уу, {user.username}</div>
            <button onClick={logout} className="bg-red-400 text-white p-2 rounded my-2">
                Гарах
            </button>
        </div>
    ) : (
        <form onSubmit={handleSubmit}>
            <label>Нэвтрэх нэр:</label>
            <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <label>Нууц үг:</label>
            <input
                type="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-blue-400 text-white p-2 rounded my-2">Нэвтрэх</button>
            <h3>Бичвэр засварлагчийн жишээ:</h3>
            <Editor
                initialValue={value}
                init={tinymceOptions}
                onBlur={(e) => setValue(e.target.getContent())}
            />
        </form>
    );
};

export default Login;

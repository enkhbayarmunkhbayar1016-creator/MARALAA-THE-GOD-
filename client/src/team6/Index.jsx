import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./Home";
import Example from "./Example";

const Index = () => {
  return (
    <Routes>
      <Route path="" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='example' element={<Example />} />
      </Route>
    </Routes>
  );
};

export default Index;
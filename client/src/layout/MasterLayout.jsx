import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MasterLayout = () => {
  return (
    <>
      <Header />
      <main className='py-6 px-4 sm:p-6 md:py-10 md:px-8'>
        <div className='w-full'>
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MasterLayout;

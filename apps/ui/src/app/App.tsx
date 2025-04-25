import { useSelector } from './redux/store';
import { AppRoutes } from './routes';
import { HelmetProvider } from 'react-helmet-async';
import './App.scss';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import './assets/layout/layout.scss';
import { useLogOutMutation } from './redux/apis/del.api';

function App() {
  const { token } = useSelector((store) => store.auth);
  const [logOut] = useLogOutMutation();

  const onSignOut = () => {
    return logOut(undefined);
  };

  return (
    <HelmetProvider context={{}}>
      <AppRoutes isAuthenticated={!!token} onSignOut={onSignOut} />;
    </HelmetProvider>
  );
}

export default App;

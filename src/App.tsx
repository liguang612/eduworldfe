import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import './App.css'

import { registerItemConnectorQuestion } from './components/surveyJsCustomisations';
registerItemConnectorQuestion();

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

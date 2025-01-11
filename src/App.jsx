import { useEffect } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AddIncome from './components/AddIncome';  
import AddExpense from './components/AddExpense'; 
import SetGoals from './components/SetGoals';
import ListIncome from './components/ListIncome'; 
// import Notifications from './components/Notifications'; 
import ListExpenses from './components/ListExpenses'; 
import Budget from './components/Budget'; 
import ForgotPassword from './components/ForgotPassword';


function App() {
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/') {
      window.location.href = '/login';
    }
  }, [path]);

  return (
    <div className="App">
      {path === '/register' && <RegistrationForm />}
      {path === '/login' && <LoginForm />}
      {path === '/dashboard' && <Dashboard />}
      {path === '/add-income' && <AddIncome />}  
      {path === '/add-expense' && <AddExpense />}
      {path === '/set-goals' && <SetGoals />}
      {path === '/list-income' && <ListIncome />}
      {/* //{path === '/notifications' && <Notifications />} */}
      {path === '/list-expenses' && <ListExpenses />}
      {path === '/Budget' && <Budget />}
      {path === '/forgot-password' && <ForgotPassword />}
    </div>
  );
}

export default App;
import { useEffect } from 'react';
import WelcomePage from '@/components/WelcomePage';
import RegistrationForm from '@/components/RegistrationForm';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AddIncome from '@/components/AddIncome';  
import AddExpense from '@/components/AddExpense'; 
import SetGoals from '@/components/SetGoals';
import ListIncome from '@/components/ListIncome'; 
// import Notifications from '@/components/Notifications'; 
import ListExpenses from '@/components/ListExpenses'; 
import SetBudget from '@/components/SetBudget'; 
import ForgotPassword from '@/components/ForgotPassword';
import ViewGoals from '@/components/ViewGoals';
import ViewBudget from '@/components/ViewBudget';


function App() {
  const path = window.location.pathname;

  return (
    <div className="App">
      {path === '/' && <WelcomePage />}
      {path === '/register' && <RegistrationForm />}
      {path === '/login' && <LoginForm />}
      {path === '/dashboard' && <Dashboard />}
      {path === '/add-income' && <AddIncome />}  
      {path === '/add-expense' && <AddExpense />}
      {path === '/set-goals' && <SetGoals />}
      {path === '/list-income' && <ListIncome />}
      {/* {path === '/notifications' && <Notifications />} */}
      {path === '/list-expenses' && <ListExpenses />}
      {path === '/set-budget' && <SetBudget />}
      {path === '/ForgotPassword' && <ForgotPassword />}
      {path === '/ViewGoals' && <ViewGoals />}
      {path === '/view-budget' && <ViewBudget />}
    </div>
  );
}

export default App;

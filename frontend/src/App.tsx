import { MatterManagementProvider } from './context/MatterManagementContext';
import { MatterContainer } from './views/MatterContainer';

function App() {
  return (
    <MatterManagementProvider>
      <MatterContainer />
    </MatterManagementProvider>
  );
}

export default App;


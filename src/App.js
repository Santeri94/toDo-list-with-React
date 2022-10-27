import React, { useState, useEffect } from 'react';
import './App.css';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddTodo from './AddTodo';

// database on tehty firebaseen, sit fetchataan root nodesta (items) / .json file
// sit laitetaan response -> response.json() joka siis ottaa reponse streamin ja parsee sen js object muotoo
// sit sen tulos menee stateen..HOX Object.values() palauttaa object valuet arrayna = array of todo objects
// sit käytetää useEffect hookkia joka käynnistää fetch metodin ekan renderin jälkee
// sit rendereoidaan todo:t ag-grid componentissa

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [])


  const fetchItems = () => {
    fetch('https://todolist-6370c-default-rtdb.europe-west1.firebasedatabase.app/items/.json')
    .then(response => response.json())
    .then(data => addKeys(data)) // vaihettiin Object.values()->addKeys
    .catch(err => console.error(err))
  }


   // Add keys to the todo objects
   // eli ku j.son on parsettu responsesta -> laitetaan sen vastaus tänne functioo
   // functio combinee valuet ja keyt samaa objectii -> mappaa läpi vastauksen, jokaisella mappauksella se lisää avaimen todo objectii
   // käyttämällä Object.defineProperty() functiota -> lopuksi tallettaa tehdyn arrayn (valueKeys) todos stateen
   // eli siis mappaa avaimen ja laittaa sen objectille tässä luotuun propertyyn id -> helpottaa objecteiden poistamista
   const addKeys = (data) => {
    const keys = Object.keys(data);
    const valueKeys = Object.values(data).map((item, index) => 
    Object.defineProperty(item, 'id', {value: keys[index]}));
    setTodos(valueKeys);
  }


  const addTodo = (newTodo) => {
    fetch('https://todolist-6370c-default-rtdb.europe-west1.firebasedatabase.app/items/.json',
    {
      method: 'POST',
      body: JSON.stringify(newTodo)
    })
    .then(response => fetchItems())
    .catch(err => console.error(err))
  }

  // tässä siis poistetaan databasesta objecti, functio ottaa parametrinä objecti id -> DELETE request id mukana databasee
  // sitten vastaus menee fetchitems functioo joka renderoi uuden databasen sisällön 
  const deleteTodo = (id) => {
    fetch(`https://todolist-6370c-default-rtdb.europe-west1.firebasedatabase.app/items/${id}.json`,
    {
      method: 'DELETE',
    })
    .then(response => fetchItems())
    .catch(err => console.error(err))
  }


// HOX <AddTodo> renderoidaan täällä vasta appbarin jälkeen eli se renderoi vain dialog napin
// dialog napin alla on renderoitu sit agGrid componentti jolle annetaan stylet rowdata=todos lista
// ja columnit joille omat atribuutit ja nimet
// tehään delete buttonille oma columni ja lisätään sinne buttoni jotta saadaa rivi kerrallaa poistettua objectit
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">
            TodoList
          </Typography>
        </Toolbar>
      </AppBar> 
      <AddTodo addTodo={addTodo} /> 
      <div className="ag-theme-material" style={ { height: 400, width: 600, margin: 'auto' } }>
        <AgGridReact rowData={todos}>
          <AgGridColumn sortable={true} filter={true} field='description' />
          <AgGridColumn sortable={true} filter={true} field='date' />
          <AgGridColumn sortable={true} filter={true} field='priority' />
          <AgGridColumn 
            headerName=''
            field='id' 
            width={90}
            cellRenderer={ params => 
              <IconButton onClick={() => deleteTodo(params.value)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            }
          /> 
        </AgGridReact>
      </div>
    </div>
  );
}

export default App;
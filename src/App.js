import React from 'react';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';

function App() {
  return (
    <div>
      <h1>學校餐車查詢系統</h1>
      <AddTruckForm />
      <hr />
      <TruckList />
    </div>
  );
}

export default App;


//https://console.cloudinary.com/app/c-52b22a1a285d1828bf344d100f615a/settings/upload/presets
//https://console.firebase.google.com/project/cgu-foodtruck/settings/general/web:ODllMDVmYjktMTBhOC00OGZhLWE5MjgtZDRiZTk0MDBjMTU4?nonce=1747594581487
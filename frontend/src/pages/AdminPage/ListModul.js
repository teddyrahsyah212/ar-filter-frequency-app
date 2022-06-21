import { useContext } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import ModuleCard from "../../components/ModuleCard";
import { ModuleContext } from "../../context/ModuleContext";

const AdminPanelListMateri = () => {

    const {handleChangeModule, addModule, moduleList} = useContext(ModuleContext)

    return ( 
        <div className="admin-panel-container">
            <AdminNavbar />
            <div className="list-container">
                <h1 className="list-title">List Modul</h1>
                <div className="add-module-form">
                    <form>
                        <input type="text" className="input-text add-module-input" onChange={handleChangeModule} name='moduleTitle' placeholder="Nama Modul" />
                        <button className="btn add-module-btn" onClick={addModule}>Tambah Modul</button>
                    </form>
                </div>
                <div>
                    {moduleList && moduleList.map(module => (
                        <ModuleCard 
                            key={module.moduleTitle} 
                            title={module.moduleTitle} 
                            number={module.moduleNumber} 
                            type='module' 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
 
export default AdminPanelListMateri;
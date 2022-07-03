import { createContext, useState } from "react";
import axios from 'axios'
import Cookies from "js-cookie"

export const ModuleContext = createContext();

export const ModuleContextProvider = ({ children }) => {
    
    const token = Cookies.get('token')

    // Module State
    const [moduleNum, setModuleNum] = useState(1)
    const [module, setModule] = useState({
        moduleNumber: moduleNum,
        moduleTitle: '',
    })
    const [moduleList, setModuleList] = useState([])

    // Theory State
    const [ theoryNum, setTheoryNum ] = useState(1)
    const [ theoryList, setTheoryList ] = useState([])
    const [ theory, setTheory ] = useState({
        theoryNumber: theoryNum,
        title: '',
    })
    const [theoryDescription, setTheoryDescription] = useState('')
    const [image, setImage] = useState(null)

    // Lab State
    const [ labNum, setLabNum ] = useState(1)
    const [ labList, setLabList ] = useState([])
    const [labModel, setlabModel] = useState(null)
    const [ lab, setLab ] = useState({
        labNumber: labNum,
        title: '',
        description: '',
    })

    // Checking moduleNumber
    const checkModuleNumber = () => {
        moduleList.map(modul => {
            if(moduleNum === modul.moduleNumber) setModuleNum(modul.moduleNumber +1)
        })
    }
    const checkTheoryNumber = () => {
        theoryList.map(theory => {
            if(theoryNum === theory.theoryNumber) setModuleNum(theory.theoryNumber +1)
            console.log(theoryNum,theory.theoryNumber)
        })
    }
    
    // Module CRUD
    const handleChangeModule = (e) => {
        setModule({
            ...module, 
            moduleNumber: moduleNum,
            [e.target.name]: e.target.value
        })
    }

    const getModule = async () => {
        const result = await axios.get('http://localhost:8000/api/module')
        const data = result.data.results
        setModuleList(data.map(modul => {
            return {
                moduleNumber: modul.moduleNumber,
                moduleTitle: modul.moduleTitle,
                modulId: modul.id,
            }
        }))
    }

    const getDetailModule = (modulId) => {
        axios.get(`http://localhost:8000/api/module/${modulId}`, {headers: {"Authorization" : "Bearer "+ token, 'Access-Control-Allow-Origin': '*'}})
        .then(res => {
            const dataModul = res.data.results
            setModule(dataModul)
            setTheoryList(dataModul.theory.map(materi => {
                return {
                    theoryNumber: materi.theoryNumber,
                    title: materi.title,
                    description: materi.description,
                    image: materi.image,
                    theoryId: materi._id,
                    moduleNumber: materi.moduleNumber,
                    moduleTitle: materi.modulTitle,
                    moduleId: materi.moduleId,

                }
            }))
            setLabList(dataModul.lab.map(lab => {
                return {
                    labNumber: lab.labNumber,
                    title: lab.title,
                    description: lab.description,
                    thumbnailAR: lab.thumbnailAR,
                    modelAR: lab.modelAR,
                    labId: lab._id,
                    moduleNumber: lab.moduleNumber,
                    moduleTitle: lab.modulTitle,
                    moduleId: lab.moduleId,

                }
            }))
        })
    }

    const addModule = (e) => {
        e.preventDefault()
        axios.post('http://localhost:8000/api/module/create', {
            moduleNumber: module.moduleNumber,
            title: module.moduleTitle,
        }, {headers: {"Authorization" : `Bearer ${token}`}})
        .catch(err => console.log(err))
        setModuleNum(moduleNum + 1)
    }

    const deleteModule = (moduleId) => {
        axios.delete(`http://localhost:8000/api/module/${moduleId}`, 
        {headers: {"Authorization" : `Bearer ${token}`}})
        .catch(err => console.log(err))
    }

    // Theory CRUD
    
    const handleChangeTheory = (e) => {
        setTheory({
            ...theory,
            [e.target.id]: e.target.value
        })
    }

    const handleDescription = (desc) => {
        const str = desc.replace(/^\<p\>/,"").replace(/\<\/p\>$/,"");
        setTheoryDescription(str)
    }
    
    const handleImage = (e) => setImage(e.target.files[0])

    const addTheory = (moduleId, modulNumber, modulTitle) => {
        // http://localhost:8000/api/module/:moduleId/create-theory
        const data = new FormData()
        data.append("theoryNumber", theoryNum)
        data.append("title", theory.title)
        data.append("description", theoryDescription)
        data.append("moduleNumber", modulNumber)
        data.append("moduleTitle", modulTitle)
        data.append("image", image, image.name)
        axios.patch(`http://localhost:8000/api/module/${moduleId}/create-theory`, data,
        {headers: {"Authorization" : `Bearer ${token}`}})
        .catch(err => console.log(err))
        setTheoryNum(theoryNum + 1)
    }

    const deleteTheory = (moduleId, theoryId) => {
        // api/module/:id/:theoryId/delete-theory
        axios.patch(`http://localhost:8000/api/module/${moduleId}/${theoryId}/delete-theory`, {
            headers: {"Authorization": `Bearer ${token}`}
        }).catch(err => console.log(err))
        // console.log(`http://localhost:8000/api/module/${moduleId}/${theoryId}/delete-theory`)
    }

    // Lab CRUD
    const handleModel = (e) => setlabModel(e.target.files[0])

    const addLab = (moduleId, modulNumber, modulTitle) => {
        // http://localhost:8000/api/module/:moduleId/create-lab
        const data = new FormData()
        data.append("labNumber", labNum)
        data.append("title", lab.title)
        data.append("description", theoryDescription)
        data.append("moduleNumber", modulNumber)
        data.append("moduleTitle", modulTitle)
        data.append("thumbnail", image, image.name)
        data.append("model", labModel, labModel.name)
        axios.patch(`http://localhost:8000/api/module/${moduleId}/create-lab`, data,
        {headers: {"Authorization" : `Bearer ${token}`, 'Content-Type': 'multipart/form-data'}})
        .catch(err => console.log(err))
        setLabNum(labNum + 1)
    }
    
    const handleChangeLab = (e) => {
        setLab({
            ...lab, 
            labNumber: labNum,
            [e.target.name]: e.target.value
        })
    }

    const deleteLab = (moduleId, labId) => {
        axios.patch(`http://localhost:8000/api/module/${moduleId}/${labId}/delete-theory`, {
            headers: {"Authorization": `Bearer ${token}`}
        }).catch(err => console.log(err))
    }

    return (
        <ModuleContext.Provider value={{
                module, 
                setModule, 
                addModule,
                getModule,
                moduleList,
                handleChangeModule,
                deleteModule,
                getDetailModule,
                theoryList,
                theory,
                addTheory,
                handleChangeTheory,
                handleDescription,
                theoryDescription,
                deleteTheory,
                labList,
                addLab,
                handleChangeLab,
                deleteLab,
                handleModel,
                handleImage,
                checkModuleNumber,
                checkTheoryNumber
            }}>
            {children}
        </ModuleContext.Provider>
    )
}
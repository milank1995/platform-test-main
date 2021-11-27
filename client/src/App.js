import React from 'react'
import { Steps, Button } from 'antd';
import { CheckCircleTwoTone, CloseCircleOutlined } from '@ant-design/icons';
import axios from "axios";
import 'antd/dist/antd.css';
import './App.css'

const { Step } = Steps;



function App() {
    const [current, setCurrent] = React.useState(0);
    const [ file, setFile] = React.useState({});
    const [data, setData] = React.useState({data: [], error: []});


    const handleFileUpload = e => {
        const files = e.target.files[0];
        const formData = new FormData();
        formData.append('file', files);
        setFile(formData)
    }

    const steps = [
        {
            title: 'Products',
            content:  <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
            />
        },
        {
            title: 'Results',
            content: <div>
                {data.data.map((item)=>(
                    <div className="result-list">
                        <div className="result-item">
                            <div>    <CheckCircleTwoTone twoToneColor="#52c41a" /> {item.id || ""}  </div> - <div>  {item.name || ""}  </div> - <div>  Height: {item.picture.height || ""}  </div> <div>   Width: {item.picture.width || ""}</div>
                        </div>
                        <img src={item.picture.url || ''} height={50} width={50}/>

                    </div>
                    ))}
                {data.error.map((item)=>(
                    <div className="result-list">
                        <div className="result-item">
                            <div><CloseCircleOutlined twoToneColor="#FF0000" /> {item.id || ""}</div> -  Error In Image Loading
                        </div>

                    </div>
                ))}
            </div>,
        },
    ];




    const handleSubmit = () => {
        axios.post(' http://localhost:5000/upload', file).then(res => {
            // console.log('resr', res)
            if(res.status === 200){
                setData(res.data)
                setCurrent(1)
            }
        })
    }

  return (
    <div className="App">
        <div className="validate-button">
            {current === 0 && <Button type="primary" onClick={handleSubmit}>
                Validate
            </Button>}
        </div>
        <Steps current={current}>
            {steps.map(item => (
                <Step key={item.title} title={item.title} />
            ))}
        </Steps>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action">

        </div>
    </div>
  )
}

export default App

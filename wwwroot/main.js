import { initViewer, loadModel } from './viewer.js'
import { getFakeDataFromServer } from './tagsServer.js'
import { addGeometry } from './bolaspeludas.js'
import { crearSpritesAlertas } from './alertas.js'

let viewer2
var abierto = false
let uniqueValues4 = {}
function getAllLeafComponents(viewer, callback) {
  var cbCount = 0 // count pending callbacks
  var components = [] // store the results
  var tree // the instance tree

  function getLeafComponentsRec(parent) {
    cbCount++
    if (tree.getChildCount(parent) != 0) {
      tree.enumNodeChildren(
        parent,
        function (children) {
          getLeafComponentsRec(children)
        },
        false
      )
    } else {
      components.push(parent)
    }
    if (--cbCount == 0) callback(components)
  }
  viewer.getObjectTree(function (objectTree) {
    tree = objectTree
    var allLeafComponents = getLeafComponentsRec(tree.getRootId())
  })
}

initViewer(document.getElementById('preview')).then((viewer) => {
  toastr.options = { positionClass: 'toast-top-center' }
  const urn = window.location.hash?.substring(1)
  setupModelSelection(viewer, urn)
  setupModelUpload(viewer)
  const buttonBuscar = document.getElementById('buscar')
  const buttonFakedata = document.getElementById('fakeData')
  const proceso = document.getElementById('proceso')
  const atex = document.getElementById('atex')
  
  buttonBuscar.onclick = async () => {
    const textoBuscar = document.getElementById('textoBuscar')
    console.log('buscamos ' + textoBuscar)
    // viewer.search(textoBuscar.value, (dbids) => {
    // Buscar dbids
    const response = await fetch('/api/mydata')
    const data = await response.json()
    const dbids = data.dbids
   
  viewer.isolate(dbids)
  viewer.fitToView(dbids)
  //viewer.select(dbids)
  console.log('-----------------------------------------------')
  console.log(dbids)  

    viewer.model.getBulkProperties(
      dbids, // Aquí debería de pasar la variable dbids que es el resultado de la búsqueda
      ['Longitud', 'Área'],
      (res) => {
        let longitudTotal = 0
        let areaTotal = 0
        res.forEach((dbid) => {
          longitudTotal += dbid.properties.find(
            (p) => p.displayName === 'Longitud'
          )?.displayValue
          areaTotal += dbid.properties.find(
            (p) => p.displayName === 'Área'
          )?.displayValue
        })
        document.getElementById('length').innerHTML = longitudTotal.toFixed(2)
        document.getElementById('area').innerHTML = areaTotal.toFixed(2)
      }
    )
    // })
  }

  buttonFakedata.onclick = async () => {
    const dbids = await getFakeDataFromServer()
    viewer.isolate(dbids)
    viewer.fitToView(dbids)
console.log('*++++++++++++++++')
    viewer.model.getBulkProperties(dbids, ['Área', 'Volumen'], (res) => {
      let area = 0.0
      let volumen = 0.0
      res.forEach((item) => {
        const _area = item.properties.find(
          (x) => x.displayName === 'Área'
        )?.displayValue
        if (_area) area += _area
        const _volumen = item.properties.find(
          (x) => x.displayName === 'Volumen'
        )?.displayValue
        if (_volumen) volumen += _volumen
      })
      document.getElementById('totalArea').innerText = area
        ? area.toFixed(2)
        : 'n/a'
      document.getElementById('totalVolumen').innerText = volumen
        ? volumen.toFixed(2)
        : 'n/a'
    })
  }
  const preview = document.getElementById('preview')
  preview.style.height = '100%'
  proceso.onclick = () => {
    if (preview.style.height === '100%') {
      preview.style.height = '50%'
      proceso.innerText = 'Close P&ID'
      abierto = true
    } else {
      preview.style.height = '100%'
      proceso.innerText = 'P&ID'
      abierto = false
    }

    viewer.resize()
  }
//aqui empieza
  
  //aqui acaba
  viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, () => {
    getAllLeafComponents(viewer, function (dbIds) 
    {
      let uniqueValues = {}
      viewer.model.getBulkProperties(dbIds, ['Tag'], (res) => {
        res.filter((item) => {
          let displayValue = item.properties[0].displayValue
          if (uniqueValues[displayValue]) {
            uniqueValues[displayValue].push(item.dbId)
            return
          } else {
            uniqueValues[displayValue] = [item.dbId]
            return
          }
        })
        //console.log(uniqueValues)
        // Seleccionar el elemento <select>
        let selectElement = document.getElementById('uniqueSelect')
        
        // Rellenar el elemento <select> con los valores únicos de uniqueValues
        Object.keys(uniqueValues).forEach((displayValue) => {
          let option = document.createElement('option')
          option.value = displayValue
          option.textContent = displayValue
          selectElement.appendChild(option)
        })

        // Añadir un listener para el evento change
        selectElement.addEventListener('change', function (event) {
          // Obtener el valor seleccionado
          let selectedValue = event.target.value
          const _dbids = uniqueValues[selectedValue]
          // Hacer algo con el valor seleccionado, por ejemplo, mostrarlo en la consola
          
          
          viewer.isolate(_dbids)
          viewer.fitToView  (_dbids)

          // Hay que intentar encontrar
          if (abierto){
            const itemsPid = viewer2.model.getBulkProperties(
              [],
              ['Tag'],
              (res) => {
                const item = res.find(
                  (x) => x.properties[0].displayValue === selectedValue
                )
                if (item) {
                  toastr.success('Tag encontrado')
                                   
                  const camera = viewer2.navigation.getCamera()
                  viewer2.select(item.dbId)
                  const iden = viewer2.getSelection();
                  viewer2.isolate(iden)
                  viewer2.fitToView(iden)

                } else {
                  toastr.error('Tag NO encontrado')
                }
                toastr.clearNotification
                console.log('pid: ', item)
               
              }
            )
        }
        })
      })

      //ojo
      let uniqueValues2 = {}
      viewer.model.getBulkProperties(dbIds, ['Service'], (res) => {
        res.filter((item) => {
          let displayValue2 = item.properties[0].displayValue
          if (uniqueValues2[displayValue2]) {
            uniqueValues2[displayValue2].push(item.dbId)
            return
          } else {
            uniqueValues2[displayValue2] = [item.dbId]
            return
          }
        })
        //console.log(uniqueValues2)
        // Seleccionar el elemento <select>
        let selectElement2 = document.getElementById('uniqueSelect2')

        // Rellenar el elemento <select> con los valores únicos de uniqueValues
        Object.keys(uniqueValues2).forEach((displayValue2) => {
          let option2 = document.createElement('option')
          option2.value = displayValue2
          option2.textContent = displayValue2
          selectElement2.appendChild(option2)
        })

        // Añadir un listener para el evento change
        selectElement2.addEventListener('change', function (event) {
          // Obtener el valor seleccionado
          let selectedValue2 = event.target.value
          const _dbids2 = uniqueValues2[selectedValue2]
          // Hacer algo con el valor seleccionado, por ejemplo, mostrarlo en la consola
          viewer.isolate(_dbids2)
          viewer.fitToView(_dbids2)

          // Hay que intentar encontrar
          
          
        })
      })
      //ojo2

      //ojo3
      let uniqueValues3 = {}
      viewer.model.getBulkProperties(dbIds, ['Line Number'], (res) => 
        {
        res.filter((item) => {
          let displayValue3 = item.properties[0].displayValue
          if (uniqueValues3[displayValue3]) {
            uniqueValues3[displayValue3].push(item.dbId)
            return
          } else {
            uniqueValues3[displayValue3] = [item.dbId]
            return
          }
        })
        //console.log(uniqueValues3)
        // Seleccionar el elemento <select>
        let selectElement3 = document.getElementById('uniqueSelect3')

        // Rellenar el elemento <select> con los valores únicos de uniqueValues
        Object.keys(uniqueValues3).forEach((displayValue3) => {
          let option3 = document.createElement('option')
          option3.value = displayValue3
          option3.textContent = displayValue3
          selectElement3.appendChild(option3)
        })
        

        
        // Añadir un listener para el evento change
        selectElement3.addEventListener('change', function (event) {
          // Obtener el valor seleccionado
          let selectedValue3 = event.target.value
          const _dbids3 = uniqueValues3[selectedValue3]
          // Hacer algo con el valor seleccionado, por ejemplo, mostrarlo en la consola
          viewer.isolate(_dbids3)
          viewer.fitToView(_dbids3)

          // Hay que intentar encontrar
          
          
        })

        //ojo4

        
        //f ojo4
      })
      
      let uniqueValues4 = {}
      viewer.model.getBulkProperties(dbIds, ['Atex'], (res) => 
        {
        res.filter((item) => {
          let displayValue4 = item.properties[0].displayValue
          if (uniqueValues4[displayValue4]) {
            uniqueValues4[displayValue4].push(item.dbId)
            return
          } else {
            uniqueValues4[displayValue4] = [item.dbId]
            return
          }
        })
        //console.log(uniqueValues3)
        // Seleccionar el elemento <select>
        let selectElement4 = document.getElementById('uniqueSelect4')
         let option4 = document.createElement('option')
         option4.value = '-'
         option4.textContent = '-'
         selectElement4.appendChild(option4)
        // Rellenar el elemento <select> con los valores únicos de uniqueValues
        Object.keys(uniqueValues4).forEach((displayValue4) => {
          let option4 = document.createElement('option')
          option4.value = displayValue4
          option4.textContent = displayValue4
          selectElement4.appendChild(option4)
        })
        

        
        // Añadir un listener para el evento change
        selectElement4.addEventListener('change', function (event) {
          // Obtener el valor seleccionado
          let selectedValue4 = event.target.value
          const _dbids4 = uniqueValues4[selectedValue4]
          // Hacer algo con el valor seleccionado, por ejemplo, mostrarlo en la consola
          viewer.isolate(_dbids4)
          viewer.fitToView(_dbids4)

          // Hay que intentar encontrar
          
          
        })

        //ojo4

        
        //f ojo4
      })
      
      
      
      //ojo3

      
      
    })

    //addGeometry(viewer)
    crearSpritesAlertas(viewer)

    //const urn2 =
      //'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zng1bHIxd3NnYmZ4Y25yOWFvb3dnYXZlZ3kwemFtcXMtaml0LWRldi8xMjMuZHdm'
    const urn2 = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zng1bHIxd3NnYmZ4Y25yOWFvb3dnYXZlZ3kwemFtcXMtaml0LWRldi9EV0ZfMERERTYuZHdm'
    
      initViewer(document.getElementById('preview2')).then((_viewer2) => {
      viewer2 = _viewer2
      loadModel(_viewer2, urn2)
    })
  })

  // Añadir evento al viewer
  viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, () => {
    const dbid = viewer.getSelection()[0]
    // Get Properties sólo devuelve las propiedaded de UN dbid
    viewer.getProperties(dbid, (res) => {
      //console.log(res)
      const category = res.properties.find(
        (p) => p.attributeName === 'Category'
      )?.displayValue
      const type = res.properties.find(
        (p) => p.attributeName === 'Type Name'
      )?.displayValue
      const length = res.properties.find(
        (p) => p.attributeName === 'Length'
      )?.displayValue
      const area = res.properties.find(
        (p) => p.attributeName === 'Area'
      )?.displayValue
      //document.getElementById('category').innerText = category
      //document.getElementById('type').innerText = type
      //document.getElementById('length').innerText = length
        //? length.toFixed(2)
       // : 'n/a'
     // document.getElementById('area').innerText = area ? area.toFixed(2) : 'n/a'
    })
  })
})

async function setupModelSelection(viewer, selectedUrn) {
  const dropdown = document.getElementById('models')
  dropdown.innerHTML = ''
  try {
    const resp = await fetch('/api/models')
    if (!resp.ok) {
      throw new Error(await resp.text())
    }
    const models = await resp.json()
    dropdown.innerHTML = models
      .map(
        (model) =>
          `<option value=${model.urn} ${
            model.urn === selectedUrn ? 'selected' : ''
          }>${model.name}</option>`
      )
      .join('\n')
    dropdown.onchange = () => onModelSelected(viewer, dropdown.value)
    if (dropdown.value) {
      onModelSelected(viewer, dropdown.value)
    }
  } catch (err) {
    alert('Could not list models. See the console for more details.')
    console.error(err)
  }
}

async function setupModelUpload(viewer) {
  const upload = document.getElementById('upload')
  const input = document.getElementById('input')
  const models = document.getElementById('models')
  upload.onclick = () => input.click()
  input.onchange = async () => {
    const file = input.files[0]
    let data = new FormData()
    data.append('model-file', file)
    if (file.name.endsWith('.zip')) {
      // When uploading a zip file, ask for the main design file in the archive
      const entrypoint = window.prompt(
        'Please enter the filename of the main design inside the archive.'
      )
      data.append('model-zip-entrypoint', entrypoint)
    }
    upload.setAttribute('disabled', 'true')
    models.setAttribute('disabled', 'true')
    showNotification(
      `Uploading model <em>${file.name}</em>. Do not reload the page.`
    )
    try {
      const resp = await fetch('/api/models', { method: 'POST', body: data })
      if (!resp.ok) {
        throw new Error(await resp.text())
      }
      const model = await resp.json()
      setupModelSelection(viewer, model.urn)
    } catch (err) {
      alert(
        `Could not upload model ${file.name}. See the console for more details.`
      )
      console.error(err)
    } finally {
      clearNotification()
      upload.removeAttribute('disabled')
      models.removeAttribute('disabled')
      input.value = ''
    }
  }
}

async function onModelSelected(viewer, urn) {
  if (window.onModelSelectedTimeout) {
    clearTimeout(window.onModelSelectedTimeout)
    delete window.onModelSelectedTimeout
  }
  window.location.hash = urn
  try {
    const resp = await fetch(`/api/models/${urn}/status`)
    if (!resp.ok) {
      throw new Error(await resp.text())
    }
    const status = await resp.json()
    switch (status.status) {
      case 'n/a':
        showNotification(`Model has not been translated.`)
        break
      case 'inprogress':
        showNotification(`Model is being translated (${status.progress})...`)
        window.onModelSelectedTimeout = setTimeout(
          onModelSelected,
          5000,
          viewer,
          urn
        )
        break
      case 'failed':
        showNotification(
          `Translation failed. <ul>${status.messages
            .map((msg) => `<li>${JSON.stringify(msg)}</li>`)
            .join('')}</ul>`
        )
        break
      default:
        clearNotification()
        loadModel(viewer,'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zng1bHIxd3NnYmZ4Y25yOWFvb3dnYXZlZ3kwemFtcXMtaml0LWRldi9EZW1vXzIwMjQwNjA0Lm53ZA')
        //loadModel(viewer, urn)
        break
    }
  } catch (err) {
    alert('Could not load model. See the console for more details.')
    console.error(err)
  }
}

function showNotification(message) {
  const overlay = document.getElementById('overlay')
  overlay.innerHTML = `<div class="notification">${message}</div>`
  overlay.style.display = 'flex'
}

function clearNotification() {
  const overlay = document.getElementById('overlay')
  overlay.innerHTML = ''
  overlay.style.display = 'none'
}

// Y he añadido estas otras

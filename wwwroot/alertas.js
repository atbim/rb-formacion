export const crearSpritesAlertas = async (viewer) => {
  const dataVizExtn = await viewer.loadExtension('Autodesk.DataVisualization')

  const DataVizCore = Autodesk.DataVisualization.Core
  const viewableType = DataVizCore.ViewableType.SPRITE
  const spriteColor = new THREE.Color(0xffffff)
  const baseURL = 'http://localhost:8080/images/'
  const spriteIconUrl = `${baseURL}circle-fill.svg`

  const style = new DataVizCore.ViewableStyle(
    viewableType,
    spriteColor,
    spriteIconUrl
  )

  const viewableData = new DataVizCore.ViewableData()
  viewableData.spriteSize = 24 // Sprites as points of size 24 x 24 pixels

  const myDataList = [
    { position: { x: 100, y: 200, z: 300 } },
    { position: { x: -100, y: 0, z: 300 } },
    { position: { x: -100, y: 0, z: 500 } },
    { position: { x: -100, y: 0, z: 600 } },
  ]

  myDataList.forEach((myData, index) => {
    const dbId = 10 + index
    const position = myData.position
    const viewable = new DataVizCore.SpriteViewable(position, style, dbId)

    viewableData.addViewable(viewable)
  })

  await viewableData.finish()
  dataVizExtn.addViewables(viewableData)

  const close = document.getElementById('close')
  close.onclick = () => {
    document.getElementById('mySidebar').hidden = true
    viewer.resize()
  }

  const devices = [
    { name: 'Device 1' },
    { name: 'Device 2' },
    { name: 'Device 3' },
    { name: 'Device 4' },
  ]

  const container = document.getElementById('device-list-container')

  devices.forEach((device) => {
    const deviceItem = document.createElement('div')
    // Añadir evento de on click
    deviceItem.className = 'device-item'
    deviceItem.textContent = device.name

    container.appendChild(deviceItem)
  })

  // Configuración del gráfico
  const ctx = document.getElementById('myChart').getContext('2d')
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Speed [rpm]',
          borderColor: 'rgba(255, 196, 0, 1.0)',
          backgroundColor: 'rgba(255, 196, 0, 0.5)',
          data: [],
        },
      ],
    },
    options: {
      scales: {
        xAxes: [{ type: 'realtime', realtime: { delay: 2000 } }],
        yAxes: [{ ticks: { beginAtZero: true } }],
      },
    },
  })

  function refreshEngineSpeed(chart) {
    chart.data.datasets[0].data.push({
      x: Date.now(),
      y: 25 + Math.random() * (31 - 25),
    })
  }

  setInterval(function () {
    refreshEngineSpeed(chart)
  }, 1000)

  viewer.addEventListener(
    Autodesk.DataVisualization.Core.MOUSE_CLICK,
    (event) => {
      const targetDbId = event.dbId
      const sidebar = document.getElementById('mySidebar')
      sidebar.hidden = false
      viewer.resize()
    }
  )
}

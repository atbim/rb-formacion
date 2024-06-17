const bolaspeludas = [
  { id: 111100001, x: 0, y: 0, z: 0, color: 0xff0000 },
  { id: 111100002, x: 1000, y: 1000, z: 1000, color: 0xff0000 },
  { id: 111100003, x: 2000, y: 2000, z: 2000, color: 0xff0000 },
  { id: 111100004, x: 3000, y: 3000, z: 3000, color: 0xff0000 },
  { id: 111100004, x: 4000, y: 4000, z: 4000, color: 0xff0000 },
]

export const addGeometry = async (viewer) => {
  const sceneBuilder = await viewer.loadExtension(
    'Autodesk.Viewing.SceneBuilder'
  )
  const modelBuilder = await sceneBuilder.addNewModel({
    modelNameOverride: 'My Custom Model',
    conserveMemory: false,
  })

  bolaspeludas.forEach((bola) => {
    const sphereGeometry = new THREE.BufferGeometry().fromGeometry(
      new THREE.SphereGeometry(200, 200, 200)
    )
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0, 1, 0),
    })
    const sphereTransform = new THREE.Matrix4().compose(
      new THREE.Vector3(bola.x, bola.y, bola.z),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
    )
    const sphereFragId = modelBuilder.addFragment(
      sphereGeometry,
      sphereMaterial,
      sphereTransform
    )
    modelBuilder.changeFragmentsDbId(sphereFragId, bola.id) // Use this dbId in Viewer APIs as usual
  })
}

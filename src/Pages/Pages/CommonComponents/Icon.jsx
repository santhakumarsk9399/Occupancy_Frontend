import React from 'react'
const Icon = ({img, Img_width,Img_height }) => {
  return (
    <div>
        <img src={img} width={Img_width}height={Img_height} />
    </div>
  )
}

export default Icon
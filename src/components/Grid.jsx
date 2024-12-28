import React from 'react'
import Tile from './Tile'

const Grid = ({ emojis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {emojis.map((emoji) => (
        <Tile key={emoji.id} id={emoji.id} emoji={emoji.name} />
      ))}
    </div>
  )
}

export default Grid
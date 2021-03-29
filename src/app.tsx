import React from 'react';

import { PieExample } from './pie-chart'

import styles from './index.scss';


export function App() {
  
  return (
    <div className={styles.element}>
      <PieExample width={550} height={350}/>
    </div>
  )
}
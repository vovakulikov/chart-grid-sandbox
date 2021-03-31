import React, { useCallback, useState } from 'react';
import {
	Axis,
	GlyphSeries,
	Grid,
	LineSeries,
	Tooltip,
	XYChart,
	lightTheme,
} from '@visx/xychart';
import {curveLinear} from "@visx/curve";
import cityTemperature, { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';

import {GlyphProps} from "@visx/xychart/lib/types";
import {GlyphCross, GlyphDot, GlyphStar} from "@visx/glyph";


export type XYChartProps = {
	width: number;
	height: number;
};

type City = 'San Francisco' | 'New York' | 'Austin';

// Accessors
type Accessor = (d: CityTemperature) => number | string;

interface Accessors {
	'San Francisco': Accessor;
	'New York': Accessor;
	Austin: Accessor;
}

type DataKey = keyof Accessors;

const getDate = (d: CityTemperature) => +(new Date(d.date));
const getSfTemperature = (d: CityTemperature) => Number(d['San Francisco']);
const getNyTemperature = (d: CityTemperature) => Number(d['New York']);
const getAustinTemperature = (d: CityTemperature) => Number(d.Austin);

const accessors = {
	x: {
		'San Francisco': getDate,
		'New York': getDate,
		'Austin': getDate,
	},
	y: {
		'San Francisco': getSfTemperature,
		'New York': getNyTemperature,
		'Austin': getAustinTemperature,
	},
	date: getDate,
}

// Data and const
const data = cityTemperature.slice(225, 275);

const defaultAnnotationDataIndex = 13;
const selectedDatumPatternId = 'xychart-selected-datum';
const numTicks = 4;
const margin = { top: 10, left: 50, bottom: 30, right: 30 };

// Configuration

export function pad([x0, x1]:number[], k: number) {
	var dx = (x1 - x0) * k / 2;

	return [x0 - dx, x1 + dx];
}

const getMinAndMax = (data: CityTemperature[], accessors: Accessors ) => {
	const keys = Object.keys(accessors) as DataKey[];
	
	const resultArray = data.reduce<Array<number>>((memo, item) => {
		for (let key of keys) {
			const accessor = accessors[key as DataKey];
			
			memo.push(+accessor(item))
		}
		
		return memo;
	}, []);
	
	return [Math.min(...resultArray), Math.max(...resultArray)]
}

const dateScaleConfig = { type: 'time', paddingInner: 0.3, nice: false } as const;

const temperatureScaleConfig = {
	type: 'linear',
	domain: pad(getMinAndMax(data, accessors.y), 0.5),
	nice: true,
	zero: false,
} as const;

const config = {
	x: dateScaleConfig,
	y: temperatureScaleConfig,
};

export function XYChartExample({ width, height }: XYChartProps) {
	const [annotationDataKey, setAnnotationDataKey] = useState<DataKey | null>(null);
	const [annotationDataIndex, setAnnotationDataIndex] = useState(defaultAnnotationDataIndex);
	const [annotationLabelPosition, setAnnotationLabelPosition] = useState({ dx: -40, dy: -20 });
	const [annotationType, setAnnotationType] = useState<'line' | 'circle'>('circle');
	const [curveType, setCurveType] = useState<'linear' | 'cardinal' | 'step'>('linear');
	const [glyphComponent, setGlyphComponent] = useState<'star' | 'cross' | 'circle' | '🍍'>('circle');
	
	// derived
	const curve = curveLinear; //(curveType === 'cardinal' && curveCardinal) || (curveType === 'step' && curveStep) || curveLinear;
	const annotationDatum = data[annotationDataIndex];
	const glyphOutline = 'white'; // any color
	
	// Callbacks
	// for series that support it, return a colorAccessor which returns a custom color if the datum is selected
	const renderGlyph = useCallback(
		({ x, y, size, color, onPointerMove, onPointerOut, onPointerUp }: GlyphProps<CityTemperature>) => {
			const handlers = { onPointerMove, onPointerOut, onPointerUp };
			if (glyphComponent === 'star') {
				return <GlyphStar cx={x}  cy={y} stroke={glyphOutline} fill={color} size={size * 10} {...handlers} />;
			}
			if (glyphComponent === 'circle') {
				return <GlyphDot cx={x}  cy={y} stroke={glyphOutline} strokeWidth={2} fill={color} r={4} {...handlers} />;
			}
			if (glyphComponent === 'cross') {
				return <GlyphCross cx={x}  cy={y} stroke={glyphOutline} fill={color} size={size * 10} {...handlers} />;
			}
			return (
				<text dx="-0.75em" dy="0.25em" x={x}  y={y} fontSize={14} {...handlers}>
					🍍
				</text>
			);
		},
		[glyphComponent, glyphOutline],
	);
	
	return (
		<XYChart
			theme={lightTheme}
			xScale={config.x}
			yScale={config.y}
			height={height}
			width={width}
			captureEvents={true}
			margin={margin}
			onPointerUp={d => {
				setAnnotationDataKey(d.key as 'New York' | 'San Francisco' | 'Austin');
				setAnnotationDataIndex(d.index);
			}}
		>
			<Grid
				rows={true}
				columns={true}
				lineStyle={{ stroke: 'gray', strokeWidth: 1, strokeOpacity: 0.2 }}
			/>
			
			<LineSeries
				dataKey="Austin"
				data={data}
				xAccessor={accessors.x.Austin}
				yAccessor={accessors.y.Austin}
				curve={curve}
			/>
			<LineSeries
				dataKey="New York"
				data={data}
				xAccessor={accessors.x['New York']}
				yAccessor={accessors.y['New York']}
				curve={curve}
			/>
			
			<g>
				<LineSeries
					dataKey="San Francisco"
					data={data}
					xAccessor={accessors.x['San Francisco']}
					yAccessor={accessors.y['San Francisco']}
					curve={curve}
				/>
				
				<GlyphSeries
					dataKey="San Francisco"
					data={data}
					xAccessor={accessors.x['San Francisco']}
					yAccessor={accessors.y['San Francisco']}
					renderGlyph={renderGlyph}
				/>
			</g>
			
			<Axis
				orientation={'bottom'}
				strokeWidth={2}
				stroke={'black'}
				tickStroke={'black'}
				tickClassName={'ticks'}
				tickLabelProps={() => ({ fill: 'black' })}
			/>
			<Axis
				label={'Temperature (°F)'}
				orientation={'left'}
				numTicks={numTicks}
				strokeWidth={2}
				stroke={'black'}
				tickStroke={'black'}
				tickClassName={'ticks'}
				tickLabelProps={() => ({ fill: 'black' })}
			/>
			
			<Tooltip<CityTemperature>
				showHorizontalCrosshair={false}
				showVerticalCrosshair={true}
				snapTooltipToDatumX={false}
				snapTooltipToDatumY={true}
				showDatumGlyph={true}
				showSeriesGlyphs={true}
				renderTooltip={({ tooltipData, colorScale }) => (
					<>
						{/** date */}
						{(tooltipData?.nearestDatum?.datum &&
							new Date(accessors.date(tooltipData?.nearestDatum?.datum)).toDateString()) ||
						'No date'}
						<br />
						<br />
						{/** temperatures */}
						{((true
								? Object.keys(tooltipData?.datumByKey ?? {})
								: [tooltipData?.nearestDatum?.key]
						).filter(city => city) as City[]).map(city => {
							const temperature =
								tooltipData?.nearestDatum?.datum &&
								accessors['y'][city](
									tooltipData?.nearestDatum?.datum,
								);
							
							return (
								<div style={{ marginBottom: 4 }} key={city}>
									<em
										style={{
											color: colorScale?.(city),
											textDecoration:
												tooltipData?.nearestDatum?.key === city ? 'underline' : undefined,
										}}
									>
										{city}
									</em>{' '}
									{temperature == null || Number.isNaN(temperature)
										? '–'
										: `${temperature}° F`}
								</div>
							);
						})}
					</>
				)}
			/>
			
			{/*{annotationDataKey && annotationDatum && (*/}
			{/*	<Annotation*/}
			{/*		dataKey={annotationDataKey}*/}
			{/*		datum={annotationDatum}*/}
			{/*		dx={annotationLabelPosition.dx}*/}
			{/*		dy={annotationLabelPosition.dy}*/}
			{/*		editable={editAnnotationLabelPosition}*/}
			{/*		canEditSubject={false}*/}
			{/*		onDragEnd={({ dx, dy }) => setAnnotationLabelPosition({ dx, dy })}*/}
			{/*	>*/}
			{/*		<AnnotationConnector />*/}
			{/*		{annotationType === 'circle' ? (*/}
			{/*			<AnnotationCircleSubject />*/}
			{/*		) : (*/}
			{/*			<AnnotationLineSubject />*/}
			{/*		)}*/}
			{/*		<AnnotationLabel*/}
			{/*			title={annotationDataKey}*/}
			{/*			subtitle={`${annotationDatum.date}, ${annotationDatum[annotationDataKey]}°F`}*/}
			{/*			width={135}*/}
			{/*			backgroundProps={{*/}
			{/*				stroke: theme.gridStyles.stroke,*/}
			{/*				strokeOpacity: 0.5,*/}
			{/*				fillOpacity: 0.8,*/}
			{/*			}}*/}
			{/*		/>*/}
			{/*	</Annotation>*/}
			{/*)}*/}
		</XYChart>
	);
}

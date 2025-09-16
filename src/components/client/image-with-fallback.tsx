"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "onError" | "src"> & { src: string };

export function ImageWithFallback(props: Props) {
	const { src, alt, ...rest } = props;
	const [currentSrc, setCurrentSrc] = useState(src);
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div className="bg-muted flex items-center justify-center rounded-md" style={{ width: rest.width, height: rest.height }}>
				<span className="text-xs text-muted-foreground">No image</span>
			</div>
		);
	}

	return (
		<Image
			{...rest}
			src={currentSrc}
			alt={alt}
			onError={() => setFailed(true)}
			unoptimized
		/>
	);
}

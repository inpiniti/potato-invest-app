import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

function sanitizeSvg(xml: string): string {
  try {
    const openTagMatch = xml.match(/<svg[^>]*>/i);
    if (!openTagMatch) return xml;
    let tag = openTagMatch[0];
    const hasViewBox = /viewBox=/i.test(tag);
    // Extract width/height if present (strip units like px)
    const widthMatch = tag.match(/\bwidth="([^"]+)"/i);
    const heightMatch = tag.match(/\bheight="([^"]+)"/i);
    const toNum = (v?: string) => {
      if (!v) return NaN as unknown as number;
      const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
      return Number.isFinite(n) ? (n as number) : (NaN as unknown as number);
    };
    const w = toNum(widthMatch?.[1]);
    const h = toNum(heightMatch?.[1]);

    // Remove explicit width/height so container sizing is used
    tag = tag.replace(/\swidth="[^"]*"/gi, '');
    tag = tag.replace(/\sheight="[^"]*"/gi, '');

    if (!hasViewBox) {
      const vbW = Number.isFinite(w) ? (w as number) : 100;
      const vbH = Number.isFinite(h) ? (h as number) : Number.isFinite(w) ? (w as number) : 100;
      tag = tag.replace(/<svg/i, `<svg viewBox="0 0 ${vbW} ${vbH}"`);
    }

    return xml.replace(openTagMatch[0], tag);
  } catch {
    return xml;
  }
}

export function LogoSvg({
  uri,
  size = 24,
  className,
}: {
  uri: string;
  size?: number;
  className?: string;
}) {
  const [xml, setXml] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(uri);
        const text = await res.text();
        if (!cancelled) setXml(sanitizeSvg(text));
      } catch {
        if (!cancelled) setXml(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (!xml) return null;
  return (
    <View
      className={`overflow-hidden rounded-full bg-muted ${className || ''}`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
    </View>
  );
}

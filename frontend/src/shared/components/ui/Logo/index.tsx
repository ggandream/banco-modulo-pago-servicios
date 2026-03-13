import { Image, type ImageProps } from '@mantine/core';
import logo from '@/assets/images/logo.png';

type LogoProps = {
  size?: number;
} & Omit<ImageProps, 'src' | 'alt' | 'w' | 'h'>;

export function Logo({ size = 32, ...rest }: LogoProps) {
  return <Image src={logo} alt='BANCO SUR' w={size} fit='contain' {...rest} />;
}

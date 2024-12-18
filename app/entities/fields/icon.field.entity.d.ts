import { XoIconNameType, IconName } from '../shared-kernel';

export declare namespace IconEntity {
    type Tone = 'base' | 'inherit' | 'subdued' | 'caution' | 'warning' | 'critical' | 'interactive' | 'info' | 'success' | 'primary' | 'emphasis' | 'magic' | 'textCaution' | 'textWarning' | 'textCritical' | 'textInfo' | 'textSuccess' | 'textPrimary' | 'textMagic';
    type XotinyName = XoIconNameType;
    interface PolarisIconProps {
        /** Set the color for the SVG fill */
        tone?: Tone;
        /** Descriptive text to be read to screenreaders */
        accessibilityLabel?: string;
    }
    interface IconProps extends Omit<PolarisIconProps, 'source'> {
        name: IconName;
        size?: number;
    }
}

import { DomainException, ValueObject } from '../../../../shared/domain';

export enum TimeSlotEnum {
  SLOT_10_12 = 'SLOT_10_12',
  SLOT_12_14 = 'SLOT_12_14',
  SLOT_14_16 = 'SLOT_14_16',
  SLOT_16_18 = 'SLOT_16_18',
  SLOT_18_20 = 'SLOT_18_20',
  SLOT_20_22 = 'SLOT_20_22',
  SLOT_22_00 = 'SLOT_22_00',
}

interface TimeSlotProps {
  value: TimeSlotEnum;
}

export class TimeSlot extends ValueObject<TimeSlotProps> {
  private static readonly SLOT_LABELS: Record<TimeSlotEnum, string> = {
    [TimeSlotEnum.SLOT_10_12]: '10:00-12:00',
    [TimeSlotEnum.SLOT_12_14]: '12:00-14:00',
    [TimeSlotEnum.SLOT_14_16]: '14:00-16:00',
    [TimeSlotEnum.SLOT_16_18]: '16:00-18:00',
    [TimeSlotEnum.SLOT_18_20]: '18:00-20:00',
    [TimeSlotEnum.SLOT_20_22]: '20:00-22:00',
    [TimeSlotEnum.SLOT_22_00]: '22:00-00:00',
  };

  private constructor(props: TimeSlotProps) {
    super(props);
  }

  get value(): TimeSlotEnum {
    return this.props.value;
  }

  get label(): string {
    return TimeSlot.SLOT_LABELS[this.props.value];
  }

  public static create(value: TimeSlotEnum): TimeSlot {
    if (!Object.values(TimeSlotEnum).includes(value)) {
      throw new DomainException(`Invalid time slot: ${value}`);
    }
    return new TimeSlot({ value });
  }

  public static fromString(value: string): TimeSlot {
    if (!Object.values(TimeSlotEnum).includes(value as TimeSlotEnum)) {
      throw new DomainException(`Invalid time slot: ${value}`);
    }
    return new TimeSlot({ value: value as TimeSlotEnum });
  }

  public static getAllSlots(): TimeSlot[] {
    return Object.values(TimeSlotEnum).map((slot) => TimeSlot.create(slot));
  }

  public toString(): string {
    return this.label;
  }
}

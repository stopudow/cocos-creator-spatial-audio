export default class NullAudioParam implements AudioParam 
{
    public value: number = 0;
    public automationRate: AutomationRate = "a-rate";
    public defaultValue: number = 0;
    public maxValue: number = 0;
    public minValue: number = 0;

    public cancelAndHoldAtTime(_cancelTime: number): AudioParam 
	{
        return this;
    }

    public cancelScheduledValues(_startTime: number): AudioParam 
	{
        return this;
    }

    public exponentialRampToValueAtTime(_value: number, _endTime: number): AudioParam 
	{
        return this;
    }

    public linearRampToValueAtTime(_value: number, _endTime: number): AudioParam 
	{
        return this;
    }

    public setTargetAtTime
    (
        _target: number,
        _startTime: number,
        _timeConstant: number
    ): AudioParam 
	{
        return this;
    }

    public setValueAtTime(_value: number, _startTime: number): AudioParam 
	{
        return this;
    }

    public setValueCurveAtTime(_values: Iterable<number>, _startTime: number, _duration: number): AudioParam 
	{
        return this;
    }
}
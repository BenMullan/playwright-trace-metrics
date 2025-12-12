/*
    File:       * - xml and xslt logic (generic and reusable)
    Author:     Ben Mullan (c) 2025
*/

import * as xmlbuilder2     from "xmlbuilder2";
import * as xmlbInterfaces  from "xmlbuilder2/lib/interfaces";
import * as xsltProcessor   from "xslt-processor";

export const serialiseObjectToXml = (_inputObject :any, _xmlElementName :string) :string => {

    // eg { "key" : "value" } → <object key="value" />

    return xmlbuilder2
        .create({ version : "1.0" })
        .ele(_xmlElementName)
        .att(roundNumberAttrs_toNDecimalPlaces(_inputObject))
        .end({ prettyPrint : true, indent : "    " })
    ;

};

export const serialiseObjectArrayToXml = (_inputObjects :any[], _outerTagName :string, _childTagName :string) :string => {
    
    const _outerXmlElement :xmlbInterfaces.XMLBuilder = xmlbuilder2.create({ version : "1.0" }).ele(_outerTagName);

    _inputObjects.forEach(
        (_childObject :any) => {
            const _childXmlElement :string = serialiseObjectToXml(_childObject, _childTagName);
            _outerXmlElement.import(xmlbuilder2.create(_childXmlElement));
        }
    );

    return _outerXmlElement.end({ prettyPrint : true, indent : "    " });

};

export const zipXmlElementsTogether = (_xmlElementStrings :string[], _outerTagName :string) :string => {

    const _outerXmlElement :xmlbInterfaces.XMLBuilder = xmlbuilder2.create({ version : "1.0" }).ele(_outerTagName);

    _xmlElementStrings.forEach(
        (_xmlElementString :string) => {
            _outerXmlElement.import(xmlbuilder2.create(_xmlElementString));
        }
    );
    
    return _outerXmlElement.end({ prettyPrint : true, indent : "    " });

};

export const renderXml_intoHtml = async (_inputXml :string, _xsltTemplate :string, _xslParams :{ name :string, value :string}[]) :Promise<string> => {

    const _xsltEngine :xsltProcessor.Xslt = new xsltProcessor.Xslt({ parameters : _xslParams });
    const _xmlParser :xsltProcessor.XmlParser = new xsltProcessor.XmlParser();

    return await _xsltEngine.xsltProcess(
        _xmlParser.xmlParse(_inputXml),
        _xmlParser.xmlParse(_xsltTemplate)
    );

};

const roundNumberAttrs_toNDecimalPlaces = (_inputObject :any, _numDecimalPlaces :number = 2) => {
    
    // eg { "time" : 1258.4567879541 } → { "time" : 1258.46 }
    if ((!_inputObject) || ((typeof _inputObject) !== "object")) { return _inputObject; }

    const _roundedObject :any = {};

    for (const [_key, _value] of Object.entries(_inputObject)) {
        
        _roundedObject[_key] = ((typeof _value) === "number")
            ? (Math.round(_value * (10 ** _numDecimalPlaces)) / (10 ** _numDecimalPlaces))
            : _value
        ;

    }

    return _roundedObject;

}
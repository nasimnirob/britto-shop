
const SectionTittle = ({ subHeading, heading }) => {
    return (
        <div>
            <div className="mx-auto text-center md:w-4/12 my-8">
                <i className="text-yellow-600 mb-2">--- {subHeading} ---</i>
                <h3 className="text-3xl uppercase border-y-4 py-4 text-blue-600">{heading}</h3>
            </div>
        </div>
    );
};

export default SectionTittle;
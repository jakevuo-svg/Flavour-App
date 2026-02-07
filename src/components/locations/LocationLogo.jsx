const LocationLogo = ({ name, size = 64, logo_url }) => {
  const getAbbreviation = (locationName) => {
    const abbreviations = {
      'Black Box 360': 'BB',
      'Kellohalli': 'KH',
      'Flavour Studio': 'FS',
      'Cuisine': 'CU',
      'Pizzala': 'PZ',
      'Flavour Catering': 'FC',
    };
    return abbreviations[locationName] || locationName.substring(0, 2).toUpperCase();
  };

  const abbr = getAbbreviation(name);

  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid #ddd',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        fontSize: Math.max(16, size / 2),
        fontWeight: 'bold',
        color: '#ddd',
      }}
    >
      {abbr}
    </div>
  );
};

export default LocationLogo;

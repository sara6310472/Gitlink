import '../../style/Sort.css';

function Sort({ setUserData, originalData, currentConfig }) {
  function applyFilter(field, value, data) {
    if (!value || value === "all") {
      return data;
    }

    return data.filter((item) => {
      const fieldValue = item[field];

      if (field === "is_active") {
        return fieldValue.toString() === value;
      }

      if (field === "experience") {
        const exp = Number(fieldValue);
        switch (value) {
          case "junior": return exp <= 2;
          case "mid": return exp >= 3 && exp <= 5;
          case "senior": return exp >= 6;
          default: return true;
        }
      }

      if (field === "rating") {
        const rating = Number(fieldValue);
        switch (value) {
          case "high": return rating >= 4;
          case "medium": return rating >= 2 && rating < 4;
          case "low": return rating < 2;
          default: return true;
        }
      }

      if (field === "views") {
        const views = Number(fieldValue);
        switch (value) {
          case "high": return views >= 50;
          case "medium": return views >= 10 && views < 50;
          case "low": return views < 10;
          default: return true;
        }
      }

      if (field === "forks_count") {
        const forks = Number(fieldValue);
        switch (value) {
          case "high": return forks >= 50;
          case "medium": return forks >= 10 && forks < 50;
          case "low": return forks < 10;
          default: return true;
        }
      }

      return fieldValue &&
        fieldValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  }

  function handleFilterChange(field, value) {
    const filteredData = applyFilter(field, value, originalData);
    setUserData(filteredData);
  }

  if (!currentConfig) {
    return null;
  }

  return (
    <div className="filter-container">
      {currentConfig.map((filterGroup, index) => (
        <div key={index} className="filter-group">
          <select onChange={(e) => handleFilterChange(filterGroup.field, e.target.value)}>
            {filterGroup.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default Sort;
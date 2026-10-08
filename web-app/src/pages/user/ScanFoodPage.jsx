import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, Check, CheckCircle2, ImagePlus, LoaderCircle, RotateCcw, ScanLine, Sparkles, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeFoodImage } from '../../api/aiApi';
import { getFoods } from '../../api/foodApi';
import { createMeal } from '../../api/mealApi';
import { apiErrorMessage } from '../../api/axiosClient';
import { findFoodMatch, formatCalories, getLocalDate } from '../../utils/nutrition';

const mealTypes = [
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'lunch', label: 'Bữa trưa' },
  { value: 'dinner', label: 'Bữa tối' },
  { value: 'snack', label: 'Ăn nhẹ' },
];

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url === '[object Object]' || url.includes('[object')) return false;
  return true;
};

export default function ScanFoodPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [foodOptions, setFoodOptions] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [scanDate, setScanDate] = useState(getLocalDate());
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) { setError('Vui lòng chọn một tệp hình ảnh.'); return; }
    if (nextFile.size > 5 * 1024 * 1024) { setError('Ảnh cần có dung lượng nhỏ hơn 5 MB.'); return; }
    setFile(nextFile); setPreview(URL.createObjectURL(nextFile)); setResult(null); setError('');
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true); setError(''); setFoodOptions([]); setSelectedFoods([]);
    try {
      const nextResult = await analyzeFoodImage(file);
      setResult(nextResult);

      const fallbackFoods = await getFoods({ limit: 100 });
      const foodLists = await Promise.all(nextResult.items.map(async (item) => {
        const searchedFoods = await getFoods({ search: item.food_name, limit: 20 });
        const searchedList = searchedFoods.items || [];
        return searchedList.length
          ? searchedList
          : (fallbackFoods.items || []).filter((food) =>
              findFoodMatch([food], item.food_name)
            );
      }));

      setFoodOptions(foodLists);
      setSelectedFoods(nextResult.items.map((item, index) => {
        const match = findFoodMatch(foodLists[index], item.food_name);
        return {
          food_id: match?.id || null,
          food_name: item.food_name,
          amount_gram: Math.round(Number(item.amount_gram) || 100),
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          // Lấy URL ảnh hợp lệ từ danh mục thực phẩm đã khớp
          image_url: isValidImageUrl(match?.image_url) ? match.image_url : ''
        };
      }));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const saveToDiary = async () => {
    if (!selectedFoods.length) {
      setError('Hãy chờ AI phân tích xong trước khi lưu.');
      return;
    }
    if (selectedFoods.some((item) => !Number.isFinite(Number(item.amount_gram)) || Number(item.amount_gram) <= 0 || Number(item.amount_gram) > 9999.99)) {
      setError('Khẩu phần mỗi món phải lớn hơn 0 và không quá 9.999,99 g.');
      return;
    }
    setSaving(true); setError('');
    try {
      const form = new FormData();
      form.append('meal_type', mealType);
      form.append('meal_date', scanDate);
      form.append('items', JSON.stringify(selectedFoods.map(({ food_id, food_name, amount_gram, calories, protein, carbs, fat, image_url }) => ({
        food_id,
        food_name,
        amount_gram,
        calories,
        protein,
        carbs,
        fat,
        image_url: isValidImageUrl(image_url) ? image_url : ''
      }))));
      
      if (file) form.append('image', file);
      await createMeal(form);
      navigate('/diary');
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setFile(null); setPreview(''); setResult(null); setFoodOptions([]); setSelectedFoods([]); setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return <div className="scan-page">
    <section className="page-heading-row"><div><div className="page-eyebrow"><span className="status-dot" /> NHẬN DIỆN THÔNG MINH</div><h1>Quét món ăn</h1><p>Chụp ảnh món ăn để ước tính thành phần và dinh dưỡng.</p></div><div className="ai-powered"><Sparkles size={16} /> Phân tích bằng AI</div></section>
    {error && <div className="inline-alert">{error}</div>}
    <section className={`scan-workspace ${result ? 'has-result' : ''}`}>
      <div className="card upload-card">
        <div className="card-heading"><div><span className="section-kicker">BƯỚC 1</span><h2>Tải ảnh món ăn lên</h2></div><span className="round-icon lilac"><Camera size={19} /></span></div>
        {!preview ? <button className="upload-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files[0]); }}><span className="upload-symbol"><ImagePlus size={24} /></span><b>Kéo thả ảnh vào đây</b><span>hoặc nhấn để chọn từ thiết bị</span><small>JPG, PNG hoặc WEBP · Tối đa 5 MB</small><span className="btn btn-secondary"><Upload size={16} /> Chọn ảnh</span></button> : <div className="preview-wrap"><img src={preview} alt="Ảnh món ăn đã chọn" /><button className="preview-remove" onClick={reset} aria-label="Xóa ảnh"><X size={16} /></button><div className="preview-file"><CheckCircle2 size={16} />{file?.name}</div></div>}
        <input ref={inputRef} type="file" accept="image/*" className="visually-hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
        <div className="scan-tip"><span>✦</span><p>Ảnh rõ nét, đủ sáng sẽ giúp AI nhận diện chính xác hơn.</p></div>
        {preview && !result && <button className="btn btn-primary btn-full analyze-btn" onClick={submit} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Đang phân tích...</> : <><ScanLine size={17} /> Phân tích món ăn <ArrowRight size={16} /></>}</button>}
      </div>
      <div className="card scan-result-card">
        {!result ? <div className="result-placeholder"><div className="result-orbit"><ScanLine size={28} /></div><span className="section-kicker">{preview ? 'SẴN SÀNG PHÂN TÍCH' : 'BƯỚC 2'}</span><h2>{preview ? 'Cùng xem có gì trong đĩa nhé' : 'Kết quả sẽ xuất hiện ở đây'}</h2><p>AI sẽ nhận diện món ăn và ước tính năng lượng cùng các chất dinh dưỡng.</p><div className="result-chips"><span>◉ Calo</span><span>◉ Protein</span><span>◉ Tinh bột</span><span>◉ Chất béo</span></div></div> : <div className="scan-result-content"><div className="result-title-row"><div><span className="section-kicker">KẾT QUẢ PHÂN TÍCH</span><h2>{result.is_food ? 'Món ăn được nhận diện' : 'Chưa nhận diện được món ăn'}</h2></div><button className="icon-button" onClick={reset} aria-label="Quét lại"><RotateCcw size={17} /></button></div>{result.note && <p className="result-note">{result.note}</p>}{result.is_food && <><div className="scan-total"><span>Tổng năng lượng ước tính</span><b>{formatCalories(result.total_calories)} <small>kcal</small></b></div><div className="scan-macros"><MacroStat label="Protein" amount={result.total_protein} color="green" /><MacroStat label="Tinh bột" amount={result.total_carbs} color="orange" /><MacroStat label="Chất béo" amount={result.total_fat} color="purple" /></div><div className="recognized-list">{result.items?.map((item, i) => { const matchedFood = findFoodMatch(foodOptions[i] || [], item.food_name); return <button type="button" className={`recognized-item ${expandedItem === i ? 'is-expanded' : ''}`} key={`${item.food_name}-${i}`} onClick={() => setExpandedItem(expandedItem === i ? null : i)}><div><b>{matchedFood?.name || item.food_name}</b><small>{Math.round(item.amount_gram)} g · Độ tin cậy {Math.round(item.confidence * 100)}%</small></div><span>{formatCalories(item.calories)} kcal</span>{expandedItem === i && isValidImageUrl(matchedFood?.image_url) && <img src={matchedFood.image_url} alt={matchedFood.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}</button>; })}</div></> }</div>}
        {result?.is_food && <div className="scan-save-panel"><div className="scan-save-controls"><label><span>Loại bữa ăn</span><select value={mealType} onChange={(event) => setMealType(event.target.value)}>{mealTypes.map((meal) => <option key={meal.value} value={meal.value}>{meal.label}</option>)}</select></label><label><span>Ngày</span><input type="date" value={scanDate} max={getLocalDate()} onChange={(event) => setScanDate(event.target.value)} /></label><button className="btn btn-primary" onClick={saveToDiary} disabled={saving || selectedFoods.length === 0}>{saving ? <><LoaderCircle className="spin" size={16} /> Đang lưu...</> : <><Check size={16} /> Lưu vào nhật ký</>}</button></div></div>}
      </div>
    </section>
    <p className="disclaimer">Kết quả từ AI chỉ mang tính tham khảo và có thể không hoàn toàn chính xác.</p>
  </div>;
}

function MacroStat({ label, amount, color }) {
  return <div className="scan-macro-stat"><span className={`macro-dot ${color}`} /> <span>{label}</span><b>{Math.round(Number(amount) || 0)} g</b></div>;
}
import { useState, useEffect, useRef } from 'react'; // useRef: prevents double fetch in React Strict Mode
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Eye, User, ArrowLeft, FileText } from 'lucide-react';
import { getArticleDetail } from '../../services/articleService';
import Button from '../../../../shared/components/ui/Button';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  // React Strict Mode'da useEffect iki kez çalışır → görüntülenme 2 artıyor.
  // Bu ref ile fetch'in sadece bir kez yapılmasını garantiliyoruz.
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await getArticleDetail(id);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Makale bulunamadı</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate('/articles')}
        className="mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Makalelere Dön
      </Button>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Cover Image */}
        {article.kapak_resmi_url && (
          <img
            src={article.kapak_resmi_url}
            alt={article.baslik}
            className="w-full h-96 object-cover"
          />
        )}

        <div className="p-8">
          {/* Category */}
          {article.kategori && (
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              {article.kategori}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.baslik}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-gray-600 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-medium">
                {article.yazarAd} {article.yazarSoyad}
              </span>
              {article.yazarUnvan && (
                <span className="text-sm text-gray-500">
                  ({article.yazarUnvan})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(article.yayinlanma_tarihi).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{article.okunma_sayisi} okunma</span>
            </div>
          </div>

          {/* Summary */}
          {article.ozet && (
            <div className="bg-gray-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-gray-700 italic">{article.ozet}</p>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: article.icerik }}
          />

          {/* Tags */}
          {article.etiketler && article.etiketler.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.etiketler.map((etiket, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{etiket}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Yazar Hakkında</h3>
            <div className="flex items-start gap-4">
              {article.yazarFoto ? (
                <img
                  src={article.yazarFoto}
                  alt={`${article.yazarAd} ${article.yazarSoyad}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {article.yazarAd?.[0]}{article.yazarSoyad?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {article.yazarAd} {article.yazarSoyad}
                </p>
                {article.yazarUnvan && (
                  <p className="text-gray-600 text-sm">{article.yazarUnvan}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/hasta/uzman/${article.yazarId}`)}
                  className="mt-2"
                >
                  Profili Görüntüle
                </Button>
              </div>
            </div>
          </div>

          {/* Other Articles */}
          {article.digerMakaleler && article.digerMakaleler.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-primary-600" />
                Yazarın Diğer Makaleleri
              </h3>
              <div className="space-y-3">
                {article.digerMakaleler.map((other) => (
                  <div
                    key={other.id}
                    onClick={() => navigate(`/articles/${other.id}`)}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {other.kapak_resmi_url && (
                      <img
                        src={other.kapak_resmi_url}
                        alt={other.baslik}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{other.baslik}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(other.yayinlanma_tarihi).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}
